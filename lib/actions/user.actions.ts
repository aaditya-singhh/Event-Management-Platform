// lib/actions/user.actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { connectToDatabase } from '@/lib/database'
import User from '@/lib/database/models/user.model'
import Order from '@/lib/database/models/order.model'
import Event from '@/lib/database/models/event.model'
import { handleError } from '@/lib/utils'
import { CreateUserParams, UpdateUserParams } from '@/types'

async function safeConnect() {
  try {
    console.log('🗄️  [DB] Attempting to connect to Mongo…')
    await connectToDatabase()
    console.log('✅ [DB] Connected.')
  } catch (err) {
    console.error('❌ [DB] Connection error:', err)
    throw err
  }
}

export async function createUser(user: CreateUserParams) {
  await safeConnect()

  try {
    console.log('🔨 [User:create] Inserting:', user)
    const newUser = await User.create(user)
    console.log('✅ [User:create] Inserted with _id =', newUser._id)
    return JSON.parse(JSON.stringify(newUser))
  } catch (error) {
    console.error('❌ [User:create] Error:', error)
    handleError(error)
    throw error
  }
}

export async function getUserById(userId: string) {
  await safeConnect()

  try {
    console.log('🔍 [User:read] Finding by ID:', userId)
    const user = await User.findById(userId)
    if (!user) {
      const msg = `User ${userId} not found`
      console.warn('⚠️ [User:read]', msg)
      throw new Error(msg)
    }
    console.log('✅ [User:read] Found:', user._id)
    return JSON.parse(JSON.stringify(user))
  } catch (error) {
    console.error('❌ [User:read] Error:', error)
    handleError(error)
    throw error
  }
}

export async function updateUser(clerkId: string, userUpdates: UpdateUserParams) {
  await safeConnect()

  try {
    console.log('✏️  [User:update] clerkId:', clerkId, 'updates:', userUpdates)
    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      userUpdates,
      { new: true }
    )
    if (!updatedUser) {
      const msg = `User update failed for clerkId ${clerkId}`
      console.warn('⚠️ [User:update]', msg)
      throw new Error(msg)
    }
    console.log('✅ [User:update] Updated doc _id =', updatedUser._id)
    return JSON.parse(JSON.stringify(updatedUser))
  } catch (error) {
    console.error('❌ [User:update] Error:', error)
    handleError(error)
    throw error
  }
}

export async function deleteUser(clerkId: string) {
  await safeConnect()

  try {
    console.log('🗑️  [User:delete] Looking up clerkId:', clerkId)
    const userToDelete = await User.findOne({ clerkId })
    if (!userToDelete) {
      const msg = `User not found for clerkId ${clerkId}`
      console.warn('⚠️ [User:delete]', msg)
      throw new Error(msg)
    }
    console.log('🔗 [User:delete] Unlinking relationships for _id:', userToDelete._id)

    await Promise.all([
      Event.updateMany(
        { _id: { $in: userToDelete.events } },
        { $pull: { organizer: userToDelete._id } }
      ),
      Order.updateMany(
        { _id: { $in: userToDelete.orders } },
        { $unset: { buyer: 1 } }
      ),
    ])
    console.log('✅ [User:delete] Relationships unlinked.')

    const deletedUser = await User.findByIdAndDelete(userToDelete._id)
    console.log('✅ [User:delete] Deleted doc _id =', userToDelete._id)

    revalidatePath('/')
    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null
  } catch (error) {
    console.error('❌ [User:delete] Error:', error)
    handleError(error)
    throw error
  }
}
