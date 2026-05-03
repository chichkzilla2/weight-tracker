ALTER TABLE "WeightEntry" ADD COLUMN "recordMonth" TIMESTAMP(3);
ALTER TABLE "WaistEntry" ADD COLUMN "recordMonth" TIMESTAMP(3);

UPDATE "WeightEntry"
SET "recordMonth" = date_trunc('month', "recordedAt" + interval '7 hours') - interval '7 hours';

UPDATE "WaistEntry"
SET "recordMonth" = date_trunc('month', "recordedAt" + interval '7 hours') - interval '7 hours';

DELETE FROM "WeightEntry"
WHERE "id" IN (
  SELECT "id"
  FROM (
    SELECT
      "id",
      row_number() OVER (
        PARTITION BY "userId", "recordMonth"
        ORDER BY "recordedAt" DESC, "createdAt" DESC, "id" DESC
      ) AS rn
    FROM "WeightEntry"
  ) ranked
  WHERE ranked.rn > 1
);

DELETE FROM "WaistEntry"
WHERE "id" IN (
  SELECT "id"
  FROM (
    SELECT
      "id",
      row_number() OVER (
        PARTITION BY "userId", "recordMonth"
        ORDER BY "recordedAt" DESC, "createdAt" DESC, "id" DESC
      ) AS rn
    FROM "WaistEntry"
  ) ranked
  WHERE ranked.rn > 1
);

ALTER TABLE "WeightEntry" ALTER COLUMN "recordMonth" SET NOT NULL;
ALTER TABLE "WaistEntry" ALTER COLUMN "recordMonth" SET NOT NULL;

CREATE UNIQUE INDEX "WeightEntry_userId_recordMonth_key" ON "WeightEntry"("userId", "recordMonth");
CREATE UNIQUE INDEX "WaistEntry_userId_recordMonth_key" ON "WaistEntry"("userId", "recordMonth");
