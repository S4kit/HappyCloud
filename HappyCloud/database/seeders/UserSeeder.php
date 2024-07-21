<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('users')->insert([
            [
                'username' => 'test_user',
                'password' => '$2y$12$6vYyG9y6mCErtW.lssYpqegmHs7b9sADVdJ1P8kWGizbqCF79TP9S', //password:abcabc
                'isAdmin' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'test_user2',
                'password' => '$2y$12$6vYyG9y6mCErtW.lssYpqegmHs7b9sADVdJ1P8kWGizbqCF79TP9S',//password:abcabc
                'isAdmin' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
