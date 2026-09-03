#!/bin/bash
# Creates the cdp-defra-id-stub registrations DynamoDB table in LocalStack.
# Adapted from DEFRA/cdp-defra-id-stub compose/floci/start.d/01-create-registrations-table.sh
set -e

export AWS_REGION=eu-west-2
export AWS_DEFAULT_REGION=eu-west-2
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

ENDPOINT=http://localhost:4566
table_name="${AWS_DYNAMODB_REGISTRATIONS_TABLE_NAME:-cdp-defra-id-stub-registrations}"

echo "[INIT SCRIPT] Creating DynamoDB table '$table_name'" >&2

if aws --endpoint-url="$ENDPOINT" dynamodb describe-table --table-name "$table_name" >/dev/null 2>&1; then
  echo "Table '$table_name' already exists" >&2
else
  aws --endpoint-url="$ENDPOINT" dynamodb create-table \
    --table-name "$table_name" \
    --attribute-definitions \
      AttributeName=pk,AttributeType=S \
      AttributeName=sk,AttributeType=S \
    --key-schema \
      AttributeName=pk,KeyType=HASH \
      AttributeName=sk,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST

  echo "Created table '$table_name'" >&2
fi

aws --endpoint-url="$ENDPOINT" dynamodb update-time-to-live \
  --table-name "$table_name" \
  --time-to-live-specification "Enabled=true,AttributeName=expiresAt" >/dev/null

echo "Enabled TTL on '$table_name' using expiresAt" >&2
