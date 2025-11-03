export async function getHttpHeaderForGateway(token?: string): Promise<HeadersInit> {
  if (!token) {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}
