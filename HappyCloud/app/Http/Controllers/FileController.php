<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Folder;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Closure;
use Illuminate\Support\Facades\URL;

class FileController extends Controller
{
    public function upload(Request $request)
    {
        $user = $this->getUserFromToken($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $allowedTypes = [
            'image' => ['image/png', 'image/jpeg', 'image/svg+xml'],
            'document' => ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            'txt' => ['text/plain'],
            'video' => ['video/mp4', 'video/mpeg'],
        ];

        $maxSizes = [
            'image' => 5000, // 5MB in KB
            'document' => 25000, // 25MB in KB
            'txt' => 1024, // 1MB in KB
            'video' => 50000, // 50MB in KB
        ];

        $validator = Validator::make($request->all(), [
            'file' => [
                'required',
                'file',
                function ($attribute, $value, Closure $fail) use ($allowedTypes, $maxSizes) {
                    $fileMimeType = $value->getMimeType();
                    $type = $this->getTypeFromMimeType($fileMimeType);

                    if (!isset($allowedTypes[$type]) || !in_array($fileMimeType, $allowedTypes[$type])) {
                        $fail("The {$attribute} must be a valid {$type} file.");
                    }

                    if ($value->getSize() > $maxSizes[$type] * 1024) {
                        $fail("The {$attribute} must not be greater than " . $maxSizes[$type] / 1000 . 'MB.');
                    }
                },
            ],
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $file = $request->file('file');
        $folderId = $request->input('folder_id');

        $folder = Folder::where('id', $folderId)
            ->where('user_id', $user->id)
            ->first();

        if (!$folder) {
            return response()->json(['error' => 'Folder not found or not owned by user'], 404);
        }

        $folderPath = "uploads/{$user->id}/{$folder->folderName}";

        // Create directory if it does not exist
        Storage::makeDirectory($folderPath);

        $filePath = $file->store($folderPath);

        if (!$filePath) {
            return response()->json(['error' => 'Failed to store file'], 500);
        }

        $newFile = File::create([
            'user_id' => $user->id,
            'folder_id' => $folderId,
            'generatedName' => $file->hashName(),
            'fileName' => $file->getClientOriginalName(),
            'filePath' => $filePath,
            'mimeType' => $file->getClientMimeType(),
            'fileSize' => $file->getSize(),
        ]);

        return response()->json(['message' => $newFile], 200);
    }

    private function getTypeFromMimeType($mimeType)
    {
        $type = 'unknown';

        if (strpos($mimeType, 'image/') === 0) {
            $type = 'image';
        } elseif (in_array($mimeType, ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])) {
            $type = 'document';
        } elseif ($mimeType === 'text/plain') {
            $type = 'txt';
        } elseif (strpos($mimeType, 'video/') === 0) {
            $type = 'video';
        }

        return $type;
    }

    private function getUserFromToken(Request $request)
    {
        $token = $request->header('Authorization');
        $token = str_replace('Bearer ', '', $token);
        return User::where('token', $token)->first();
    }

    public function getFiles($id, Request $request)
    {
        $user = $this->getUserFromToken($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $folders = Folder::where('parent_id', $id)
            ->where('user_id', $user->id)
            ->get();
        $files = File::where('folder_id', $id)
            ->where('user_id', $user->id)
            ->get();

        return response()->json(['folders' => $folders, 'files' => $files], 200);
    }

    public function getOverview()
    {
        try {
            $files = File::with('user', 'folder')->get();
            $overviewData = $files->map(function ($file) {
                return [
                    'fileId' => $file->id,
                    'username' => $file->user->username,
                    'fileName' => $file->fileName,
                    'fileType' => $file->mimeType,
                    'fileSize' => $file->fileSize,
                    'folderName' => $file->folder_id ? $file->folder->folderName : 'User-ROOT',
                    'uploadDate' => $file->created_at,
                ];
            });

            return response()->json($overviewData, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function generateDownloadLink(Request $request)
    {
        $user = $this->getUserFromToken($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'fileId' => 'required|integer',
        ]);

        $fileId = $request->input('fileId');
        $file = File::findOrFail($fileId);

        $temporaryUrl = URL::temporarySignedRoute('download.file', now()->addMinutes(10), ['fileId' => $file->generatedName]);

        return response()->json(['link' => $temporaryUrl]);
    }

    public function downloadFile(Request $request, $fileId)
    {
        if (!$request->hasValidSignature()) {
            return abort(404, 'Invalid or expired link.');
        }

        // Find the file by ID
        $file = File::where('generatedName', $fileId)->first();

        // Get the full path to the file in storage
        $filePath = $file->filePath; // assuming filePath is the full path within the storage

        // Check if the file exists in storage
        if (!Storage::exists($filePath)) {
            return abort(404, 'File not found.');
        }

        // Increment the download counter
        $file->increment('downloads');

        // Return the file as a download response
        return Storage::download($filePath);
    }
    public function deleteFile(Request $request, $id)
    {
        // Validate token and authenticate user
        $user = $this->getUserFromToken($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Find the file to be deleted
        $file = File::findOrFail($id);

        // Check if the authenticated user owns the file
        if ($file->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Check if the user has permission to delete files
        $roleCheck = Role::where('user_id', $user->id)->first();
        if (!$roleCheck->deleteFile) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Delete the file from storage
        try {
            Storage::delete("{$file->path}");
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error deleting file'], 500);
        }

        // Delete the file record from the database
        $file->delete();

        return response()->json(['message' => 'File deleted successfully'], 200);
    }
}
