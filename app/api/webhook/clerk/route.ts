// app/api/webhook/clerk/route.ts

import { Webhook } from 'svix'
import { headers } from 'next/headers'
import type { WebhookEvent } from '@clerk/nextjs/server'
import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions'
import { clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { CreateUserParams, UpdateUserParams } from '@/types'

export async function POST(req: Request) {
  // 1. Load and verify your Svix secret
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
    )
  }

  // 2. Grab Svix headers
  const hdrs = headers()
  const svix_id = hdrs.get('svix-id')
  const svix_timestamp = hdrs.get('svix-timestamp')
  const svix_signature = hdrs.get('svix-signature')
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing Svix headers', { status: 400 })
  }

  // 3. Parse & verify payload
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
    console.error('❌ Webhook verification failed', err)
    return new Response('Verification failed', { status: 400 })
  }

  const { type: eventType, data } = evt

  // 4. Handle user.created
  if (eventType === 'user.created') {
    const {
      id: clerkId,
      email_addresses,
      image_url,
      first_name,
      last_name,
      username,
    } = data as any

    // Build a proper CreateUserParams object
    const createParams: CreateUserParams = {
      clerkId,
      email: email_addresses?.[0]?.email_address ?? '',
      username: username ?? '',
      firstName: first_name ?? '',
      lastName: last_name ?? '',
      photo: image_url ?? '',
    }

    const newUser = await createUser(createParams)

    if (newUser) {
      // clerkClient is already an instance—no `await clerkClient()`
      const client = await clerkClient();
      await client.users.updateUserMetadata(clerkId, {
        publicMetadata: { userId: newUser._id },
      })
    }

    return NextResponse.json({ message: 'OK', user: newUser })
  }

  // 5. Handle user.updated
  if (eventType === 'user.updated') {
    const {
      id: clerkId,
      image_url,
      first_name,
      last_name,
      username,
    } = data as any

    const updateParams: UpdateUserParams = {
      firstName: first_name ?? '',
      lastName: last_name ?? '',
      username: username ?? '',
      photo: image_url ?? '',
    }

    const updatedUser = await updateUser(clerkId, updateParams)
    return NextResponse.json({ message: 'OK', user: updatedUser })
  }

  // 6. Handle user.deleted
  if (eventType === 'user.deleted') {
    const { id: clerkId } = data as any
    const deletedUser = await deleteUser(clerkId)
    return NextResponse.json({ message: 'OK', user: deletedUser })
  }

  // 7. Ignore any other events
  return new Response(null, { status: 200 })
}

// A simple test endpoint you can hit via GET or POST
export async function GET() {
  return NextResponse.json({ message: 'Webhook route is online' })
}
