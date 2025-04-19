import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions'
import { clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // 1. Ensure we have the Svix secret
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
    )
  }

  // 2. Read and validate Svix headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', { status: 400 })
  }

  // 3. Verify payload
  const payload = await req.json()
  const body = JSON.stringify(payload)
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', { status: 400 })
  }

  const eventType = evt.type

  // 4. Handle user.created
  if (eventType === 'user.created') {
    const {
      id: clerkId,
      email_addresses,
      image_url,
      first_name,
      last_name,
      username,
    } = evt.data

    // Guarantee strings for all CreateUserParams fields
    const user = {
      clerkId,
      email: email_addresses[0]?.email_address ?? '',
      username: username ?? '',
      firstName: first_name ?? '',
      lastName: last_name ?? '',
      photo: image_url ?? '',
    }

    const newUser = await createUser(user)

    if (newUser) {
      // clerkClient is a factory, so await it first
      const client = await clerkClient()
      await client.users.updateUserMetadata(clerkId, {
        publicMetadata: { userId: newUser._id },
      })
    }

    return NextResponse.json({ message: 'OK', user: newUser })
  }

  // 5. Handle user.updated
  if (eventType === 'user.updated') {
    const { id: clerkId, image_url, first_name, last_name, username } = evt.data

    if (typeof clerkId !== 'string') {
      console.error('Missing or invalid Clerk ID for update', evt.data)
      return new Response('Bad Request', { status: 400 })
    }

    const user = {
      firstName: first_name ?? '',
      lastName: last_name ?? '',
      username: username ?? '',
      photo: image_url ?? '',
    }

    const updatedUser = await updateUser(clerkId, user)
    return NextResponse.json({ message: 'OK', user: updatedUser })
  }

  // 6. Handle user.deleted
  if (eventType === 'user.deleted') {
    const { id: clerkId } = evt.data

    if (typeof clerkId !== 'string') {
      console.error('Missing or invalid Clerk ID for delete', evt.data)
      return new Response('Bad Request', { status: 400 })
    }

    const deletedUser = await deleteUser(clerkId)
    return NextResponse.json({ message: 'OK', user: deletedUser })
  }

  // 7. All other events
  return new Response('', { status: 200 })
}

// Simple test route
export async function testPOST() {
  return Response.json({ message: 'The route is working' })
}
