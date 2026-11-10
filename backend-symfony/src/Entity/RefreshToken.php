<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class RefreshToken
{
    #[ORM\Id]
    #[ORM\Column(length: 64)]
    private string $token;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $user;

    #[ORM\Column]
    private \DateTimeImmutable $expiresAt;

    public function __construct(string $token, User $user, \DateTimeImmutable $expiresAt)
    {
        $this->token = $token;
        $this->user = $user;
        $this->expiresAt = $expiresAt;
    }

    public function getToken(): string { return $this->token; }
    public function getUser(): User { return $this->user; }
    public function getExpiresAt(): \DateTimeImmutable { return $this->expiresAt; }
}
