<?php

namespace App\Controller;

use Doctrine\DBAL\Connection;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class HealthController
{
    #[Route('/api/health', name: 'api_health', methods: ['GET'])]
    public function __invoke(Connection $connection): JsonResponse
    {
        $connection->executeQuery('SELECT 1')->fetchOne();

        return new JsonResponse([
            'status' => 'ok',
            'database' => 'ok',
        ]);
    }
}
