/**
 * Response codes and messages returned by the Automation Exercise API.
 *
 * IMPORTANT API BEHAVIOUR (found by calling the real API, not stated in its docs):
 * - The HTTP status is ALWAYS 200. The real result is in the JSON body as `responseCode`.
 * - The Content-Type header is text/html even though the body is JSON.
 * - Exception: methods the server framework itself rejects (e.g. PATCH, GET on createAccount)
 *   return a REAL HTTP 405 with a different body shape: { "detail": "Method \"PATCH\" not allowed." }
 */
export const RESPONSE_CODE = {
  ok: 200,
  created: 201,
  badRequest: 400,
  notFound: 404,
  methodNotAllowed: 405,
} as const;

export const AE_MESSAGES = {
  // Verified against the live API
  methodNotSupported: 'This request method is not supported.',
  searchParamMissing: 'Bad request, search_product parameter is missing in POST request.',
  emailParamMissing: 'Bad request, email parameter is missing in GET request.',
  emailNotFound: 'Account not found with this email, try another email!',

  // From the official API list (https://automationexercise.com/api_list)
  loginParamMissing: 'Bad request, email or password parameter is missing in POST request.',
  userExists: 'User exists!',
  userNotFound: 'User not found!',
  userCreated: 'User created!',
  userUpdated: 'User updated!',
  accountDeleted: 'Account deleted!',
} as const;
