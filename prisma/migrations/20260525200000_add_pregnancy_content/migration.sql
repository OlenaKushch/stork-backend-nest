-- CreateTable
CREATE TABLE "baby_states" (
    "id" SERIAL NOT NULL,
    "source_id" TEXT NOT NULL,
    "week_number" INTEGER NOT NULL,
    "analogy" TEXT,
    "baby_size" DOUBLE PRECISION NOT NULL,
    "baby_weight" DOUBLE PRECISION NOT NULL,
    "image" TEXT NOT NULL,
    "baby_activity" TEXT NOT NULL,
    "baby_development" TEXT NOT NULL,
    "interesting_fact" TEXT NOT NULL,
    "mom_daily_tips" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "baby_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mom_states" (
    "id" SERIAL NOT NULL,
    "source_id" TEXT NOT NULL,
    "week_number" INTEGER NOT NULL,
    "feelings" JSONB NOT NULL,
    "comfort_tips" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mom_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emotions" (
    "id" SERIAL NOT NULL,
    "source_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emotions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "baby_states_source_id_key" ON "baby_states"("source_id");

-- CreateIndex
CREATE UNIQUE INDEX "baby_states_week_number_key" ON "baby_states"("week_number");

-- CreateIndex
CREATE UNIQUE INDEX "mom_states_source_id_key" ON "mom_states"("source_id");

-- CreateIndex
CREATE UNIQUE INDEX "mom_states_week_number_key" ON "mom_states"("week_number");

-- CreateIndex
CREATE UNIQUE INDEX "emotions_source_id_key" ON "emotions"("source_id");

-- CreateIndex
CREATE UNIQUE INDEX "emotions_title_key" ON "emotions"("title");
