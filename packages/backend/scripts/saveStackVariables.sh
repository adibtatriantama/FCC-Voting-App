APP_REGION=`sls output get --name appRegion --stage test`
TABLE_NAME=`sls output get --name tableName --stage test`
LAMBDA_FUNCTION_NAME_PREFIX=`sls output get --name lambdaFunctionNamePrefix --stage test`
echo "::set-output name=APP_REGION::$APP_REGION"
echo "::set-output name=TABLE_NAME::$TABLE_NAME"
echo "::set-output name=LAMBDA_FUNCTION_NAME_PREFIX::$LAMBDA_FUNCTION_NAME_PREFIX"
