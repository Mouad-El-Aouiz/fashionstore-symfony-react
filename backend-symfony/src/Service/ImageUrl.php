<?php

namespace App\Service;

final class ImageUrl
{
    public static function resolve(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }
        if (str_starts_with($path, 'https://') || str_starts_with($path, 'http://') || str_starts_with($path, '/')) {
            return $path;
        }

        return '/'.ltrim($path, '/');
    }
}
