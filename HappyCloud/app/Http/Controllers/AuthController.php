<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Private method to handle token extraction and user retrieval
    private function getUserFromToken(Request $request)
    {
        $token = $this->extractToken($request);
        return User::where('token', $token)->first();
    }

    // Private method to extract token from the request header
    private function extractToken(Request $request)
    {
        $token = $request->header('Authorization');
        return str_replace('Bearer ', '', $token);
    }

    public function login(Request $request)
    {
        try {
            $request->validate([
                'username' => 'required|string',
                'password' => 'required|string',
            ]);

            $user = User::where('username', $request->username)->first();

            if (!$user || !$user->checkPassword($request->password)) {
                return response()->json(['error' => 'Invalid credentials'], 401);
            }

            // Generate token
            $token = bcrypt('SALT,For,Token' . $user->id);
            $user->token = $token;
            $user->save();

            return response()->json(['token' => $token], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function register(Request $request)
    {
        $user = $this->getUserFromToken($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $request->validate([
                'username' => 'required|string|unique:users',
                'password' => 'required|string|min:6',
                'isAdmin' => 'required|boolean',
                'permissions' => 'required|array',
                'permissions.uploadFile' => 'required|boolean',
                'permissions.deleteFile' => 'required|boolean',
                'permissions.createFolder' => 'required|boolean',
                'permissions.deleteFolder' => 'required|boolean',
            ]);

            $password = "startSalt{$request->password}endSalt";
            $newUser = new User();
            $newUser->username = $request->username;
            $newUser->password = bcrypt($password);
            $newUser->isAdmin = $request->isAdmin;
            $newUser->token = null;
            $newUser->save();

            Role::create([
                'user_id' => $newUser->id,
                'uploadFile' => $request->permissions['uploadFile'],
                'deleteFile' => $request->permissions['deleteFile'],
                'createFolder' => $request->permissions['createFolder'],
                'deleteFolder' => $request->permissions['deleteFolder'],
            ]);

            return response()->json(['message' => 'User registered successfully', 'user' => $newUser], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $userId)
    {
        try {
            $request->validate([
                'username' => 'required|string',
                'password' => 'nullable|string|min:6',
                'isAdmin' => 'required|boolean',
                'permissions' => 'required|array',
                'permissions.uploadFile' => 'required|boolean',
                'permissions.deleteFile' => 'required|boolean',
                'permissions.createFolder' => 'required|boolean',
                'permissions.deleteFolder' => 'required|boolean',
            ]);

            $user = User::findOrFail($userId);

            $user->username = $request->username;
            if ($request->filled('password')) {
                $password = 'startSalt' . $request->password . 'endSalt';
                $user->password = bcrypt($password);
            }
            $user->isAdmin = $request->isAdmin;
            $user->save();

            $permissions = Role::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'uploadFile' => $request->permissions['uploadFile'],
                    'deleteFile' => $request->permissions['deleteFile'],
                    'createFolder' => $request->permissions['createFolder'],
                    'deleteFolder' => $request->permissions['deleteFolder'],
                ],
            );

            return response()->json(['message' => 'User updated successfully', 'user' => $user], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function checkToken(Request $request)
    {
        $user = $this->getUserFromToken($request);

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $permissions=Role::where('user_id',$user->id)->firstOrFail();

        return response()->json([
            'user' => $user,
            'folders' => $user->folders, // Assuming a User hasMany Folders relationship
            'files' => $user->files,
            'permissions'=>$permissions // Assuming a User hasMany Files relationship
        ]);
    }

    public function getEmp(Request $request)
    {
        $user = $this->getUserFromToken($request);

        if ($user && $user->isAdmin) {
            $users = User::all();
            $permissions = Role::all();

            return response()->json([
                'usersData' => $users,
                'permissionsData' => $permissions,
            ]);
        }

        return response()->json(['error' => 'Unauthorized'], 401);
    }

    public function getEmpDetaille($id, Request $request)
    {
        $user = $this->getUserFromToken($request);

        if ($user && $user->isAdmin) {
            $userDetaille = User::findOrFail($id);
            $permissions = Role::where('user_id', $id)->first();

            return response()->json([
                'username' => $userDetaille->username,
                'isAdmin' => $userDetaille->isAdmin,
                'permissions' => $permissions,
            ]);
        }

        return response()->json(['error' => 'Unauthorized'], 401);
    }

    public function deleteUser($userId, Request $request)
    {
        $user = $this->getUserFromToken($request);

        if ($user && $user->isAdmin) {
            try {
                $userToDelete = User::findOrFail($userId);

                // Delete all files and folders associated with the user from storage
                $this->deleteUserFilesAndFolders($userToDelete);

                // Delete roles, folders, and files from the database
                Role::where('user_id', $userToDelete->id)->delete();
                User::destroy($userToDelete->id);

                return response()->json(['message' => 'User deleted successfully'], 200);
            } catch (\Exception $e) {
                return response()->json(['error' => $e->getMessage()], 500);
            }
        }

        return response()->json(['error' => 'Unauthorized'], 401);
    }

    private function deleteUserFilesAndFolders(User $user)
    {
        // Delete folders and files from the database
        $folders = $user->folders; // Assuming User model has a relationship with folders
        foreach ($folders as $folder) {
            // Delete files within this folder
            $files = $folder->files; // Assuming Folder model has a relationship with files
            foreach ($files as $file) {
                $this->deleteFileFromStorage($file->path); // Delete file from storage
                $file->delete(); // Delete file record from database
            }
            $folder->delete(); // Delete folder record from database
        }
    }

    private function deleteFileFromStorage($filePath)
    {
        if (Storage::exists($filePath)) {
            Storage::delete($filePath);
        }
    }
}
