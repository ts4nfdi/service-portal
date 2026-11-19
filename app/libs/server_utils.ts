export async function getHttpHeaderForGateway(token?: string, accept = 'application/json'): Promise<HeadersInit> {
  if (!token) {
    return {
      'Content-Type': 'application/json',
      'Accept': accept,
    }
  }

  return {
    'Content-Type': 'application/json',
    'Accept': accept,
    'Authorization': `Bearer ${token}`
  }
}
