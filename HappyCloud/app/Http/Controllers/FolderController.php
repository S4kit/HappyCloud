<?php

namespace App\Http\Controllers;

use App\Models\Folder;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FolderController extends Controller
{
    private function getUserFromToken(Request $request)
    {
        $token = $request->header('Authorization');
        $token = str_replace('Bearer ', '', $token);
        return User::where('token', $token)->first();
    }

    public function createFolder(Request $request)
    {
        $request->validate([
            'folderName' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:folders,id',
        ]);

        $user = $this->getUserFromToken($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $folder = new Folder();
            $folder->user_id = $user->id;
            $folder->folderName = $request->input('folderName');
            $folder->parent_id = $request->input('parent_id');
            $folder->save();

            return response()->json($folder, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Folder creation failed: ' . $e->getMessage()], 500);
        }
    }

    public function deleteFolder($id, Request $request)
    {
        $user = $this->getUserFromToken($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $folder = Folder::where('id', $id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            $this->deleteFolderContents($folder);
            $folder->delete();

            return response()->json(['message' => 'Folder deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Folder deletion failed: ' . $e->getMessage()], 500);
        }
    }

    private function deleteFolderContents(Folder $folder)
    {
        // Delete all files in the folder
        foreach ($folder->files as $file) {
            // Delete the file from storage
            if (Storage::exists($file->filePath)) {
                Storage::delete($file->filePath);
            }
            $file->delete();
        }

        // Recursively delete all subfolders
        foreach ($folder->children as $subfolder) {
            $this->deleteFolderContents($subfolder);
            $subfolder->delete();
        }
    }
    
}
