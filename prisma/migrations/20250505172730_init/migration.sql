-- CreateEnum
CREATE TYPE "OcurrenceStatus" AS ENUM ('EM_ABERTO', 'ACEITO', 'ATENDIDO', 'ENCERRADO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "documentPhoto" TEXT NOT NULL,
    "documentSelfie" TEXT NOT NULL,
    "documentVerified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ocurrences" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "type" TEXT DEFAULT 'Crime',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "date" TEXT,
    "time" TEXT,
    "status" "OcurrenceStatus" NOT NULL DEFAULT 'EM_ABERTO',
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "policeStation_id" TEXT,

    CONSTRAINT "ocurrences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoliceStation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoliceStation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "ocurrence_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" TEXT,
    "chat_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "PoliceStation_email_key" ON "PoliceStation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PoliceStation_phone_key" ON "PoliceStation"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "chats_ocurrence_id_key" ON "chats"("ocurrence_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "Permission"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocurrences" ADD CONSTRAINT "ocurrences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocurrences" ADD CONSTRAINT "ocurrences_policeStation_id_fkey" FOREIGN KEY ("policeStation_id") REFERENCES "PoliceStation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_ocurrence_id_fkey" FOREIGN KEY ("ocurrence_id") REFERENCES "ocurrences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
