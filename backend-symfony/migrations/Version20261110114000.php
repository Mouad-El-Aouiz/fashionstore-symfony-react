<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261110114000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Align order index names with the renamed table.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER INDEX UNIQ_F5299398551F0F81 RENAME TO UNIQ_E52FFDEE551F0F81');
        $this->addSql('ALTER INDEX IDX_F5299398A76ED395 RENAME TO IDX_E52FFDEEA76ED395');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER INDEX UNIQ_E52FFDEE551F0F81 RENAME TO UNIQ_F5299398551F0F81');
        $this->addSql('ALTER INDEX IDX_E52FFDEEA76ED395 RENAME TO IDX_F5299398A76ED395');
    }
}
