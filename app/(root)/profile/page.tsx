import React from 'react'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import Collection from '@/components/shared/Collection'
import { Button } from '@/components/ui/button'
import { getEventsByUser } from '@/lib/actions/event.actions'
import { getOrdersByUser } from '@/lib/actions/order.actions'
import { SearchParamProps } from '@/types'

export default async function ProfilePage({ searchParams }: SearchParamProps) {
  // 1. Authenticate and get Clerk user ID
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) {
    return <p>Please sign in to view your profile.</p>
  }

  // 2. Initialize Clerk client and fetch full user to get email & metadata
  const client = await clerkClient()
  const clerkUser = await client.users.getUser(clerkUserId)
  const primaryEmail =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ?? 'no-email@unknown'

  // 3. Get our DB user ID from public metadata (set in webhook)
  const dbUserId = clerkUser.publicMetadata.userId as string
  if (!dbUserId) {
    return <p>Unable to resolve your account. Please contact support.</p>
  }

  // 4. Pagination parameters
  const ordersPage = Number(searchParams?.ordersPage) || 1
  const eventsPage = Number(searchParams?.eventsPage) || 1

  // 5. Fetch orders & organized events
  const ordersResult = await getOrdersByUser({ userId: dbUserId, page: ordersPage })
  const orderedEvents = ordersResult?.data || []
  const organizedResult = await getEventsByUser({ userId: dbUserId, page: eventsPage })
  const organizedEvents = organizedResult?.data || []

  return (
    <>
      {/* Greeting & Email */}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-6">
        <div className="wrapper text-center sm:text-left">
          <h2 className="h2-bold">Welcome, {clerkUser.firstName}!</h2>
          <p className="p-regular-20 text-grey-600">Your email: {primaryEmail}</p>
        </div>
      </section>

      {/* My Tickets */}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <div className="wrapper flex items-center justify-between">
          <h3 className="h3-bold">My Tickets</h3>
          <Button asChild size="lg" className="hidden sm:flex">
            <Link href="/#events">Explore More Events</Link>
          </Button>
        </div>
      </section>

      <section className="wrapper my-8">
        <Collection
          data={orderedEvents}
          emptyTitle="No event tickets purchased yet"
          emptyStateSubtext="No worries - plenty of exciting events to explore!"
          collectionType="My_Tickets"
          limit={3}
          page={ordersPage}
          urlParamName="ordersPage"
          totalPages={ordersResult?.totalPages}
        />
      </section>

      {/* Events Organized */}
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <div className="wrapper flex items-center justify-between">
          <h3 className="h3-bold">Events Organized</h3>
          <Button asChild size="lg" className="hidden sm:flex">
            <Link href="/events/create">Create New Event</Link>
          </Button>
        </div>
      </section>

      <section className="wrapper my-8">
        <Collection
          data={organizedEvents}
          emptyTitle="No events have been created yet"
          emptyStateSubtext="Go create some now"
          collectionType="Events_Organized"
          limit={3}
          page={eventsPage}
          urlParamName="eventsPage"
          totalPages={organizedResult?.totalPages}
        />
      </section>
    </>
  )
}
