export const handler = async (event) => {
  console.log(JSON.stringify(event.Records ?? []));
  return { batchItemFailures: [] };
};
