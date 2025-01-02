-- CreateTable
CREATE TABLE `FloodReport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reporterName` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `floodStatus` VARCHAR(191) NOT NULL,
    `imagePath` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HelpRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reporterName` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `helpTypes` VARCHAR(191) NOT NULL,
    `urgencyLevel` VARCHAR(191) NOT NULL,
    `additionalDetails` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DamageReport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reporterName` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `assessmentDate` DATETIME(3) NOT NULL,
    `damageList` VARCHAR(191) NOT NULL,
    `propertyDamage` DOUBLE NOT NULL,
    `lifeImpact` VARCHAR(191) NULL,
    `additionalNotes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
