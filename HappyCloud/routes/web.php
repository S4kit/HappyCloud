<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\FolderController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return abort(403);
});


//Authentification
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth', [AuthController::class, 'checkToken']);

Route::middleware(['authToken'])->group(function () {
    //userDashboard

    Route::post('/dashboard/upload', [FileController::class, 'Upload']);
    Route::post('/create-folder', [FolderController::class, 'createFolder']);
    Route::post('/delete-folder/{id}', [FolderController::class, 'deleteFolder']);

    Route::get('/folder/{id}/files', [FileController::class, 'getFiles']);

    Route::post('/delete-file/{id}', [FileController::class, 'deleteFile']);


    Route::post('/generate-download-link', [FileController::class, 'generateDownloadLink']);

    //adminDashboard
    Route::get('/get-emplist', [AuthController::class, 'getEmp']);
    Route::get('/get-user/{id}', [AuthController::class, 'getEmpDetaille']);
    Route::post('/create-user', [AuthController::class, 'register']);
    Route::post('/update-user/{userId}', [AuthController::class, 'update']);
    Route::post('/delete-user/{userId}', [AuthController::class, 'deleteUser']);
    Route::get('/get-overview', [FileController::class, 'getOverview']);
});
Route::get('/download-file/{fileId}', [FileController::class, 'downloadFile'])->name('download.file');
