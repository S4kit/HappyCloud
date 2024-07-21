<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable
{
    use  HasFactory, Notifiable;

    protected $fillable = ['username', 'password', 'isAdmin','token'];

    protected $hidden = ['password', 'token'];

    protected $casts = [
        'isAdmin' => 'boolean',
    ];

    /**
     * Mutator for hashing password with salt before saving.
     *
     * @param string $value
     * @return void
     */
    
    /**
     * Check if the provided password matches the stored hashed password.
     *
     * @param string $password
     * @return bool
     */
    public function checkPassword($password)
    {
        $saltedPassword = 'startSalt' . $password . 'endSalt';
        return Hash::check($saltedPassword, $this->password);
        }

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    public function folders()
    {
        return $this->hasMany(Folder::class);
    }

    public function files()
    {
        return $this->hasMany(File::class);
    }
}
