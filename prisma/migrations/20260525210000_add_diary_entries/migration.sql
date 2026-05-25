-- CreateTable
CREATE TABLE "diary_entries" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diary_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diary_entry_emotions" (
    "diary_entry_id" INTEGER NOT NULL,
    "emotion_id" INTEGER NOT NULL,

    CONSTRAINT "diary_entry_emotions_pkey" PRIMARY KEY ("diary_entry_id","emotion_id")
);

-- CreateIndex
CREATE INDEX "diary_entries_user_id_created_at_idx" ON "diary_entries"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diary_entry_emotions" ADD CONSTRAINT "diary_entry_emotions_diary_entry_id_fkey" FOREIGN KEY ("diary_entry_id") REFERENCES "diary_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diary_entry_emotions" ADD CONSTRAINT "diary_entry_emotions_emotion_id_fkey" FOREIGN KEY ("emotion_id") REFERENCES "emotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
