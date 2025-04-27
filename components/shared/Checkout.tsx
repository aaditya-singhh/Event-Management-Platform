import React from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { IEvent } from '@/lib/database/models/event.model'
import { Button } from '../ui/button'
import { checkoutOrder } from '@/lib/actions/order.actions'

// Define the expected shape of the session returned by checkoutOrder
type StripeSession = { id: string }

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const Checkout = ({ event, userId }: { event: IEvent, userId: string }) => {
  const onCheckout = async (e: React.FormEvent) => {
    e.preventDefault()

    const order = {
      eventTitle: event.title,
      eventId: event._id,
      price: event.price,
      isFree: event.isFree,
      buyerId: userId
    }

    // Explicitly type the session
    const session: StripeSession = await checkoutOrder(order)

    const stripe = await stripePromise
    if (stripe && session?.id) {
      await stripe.redirectToCheckout({ sessionId: session.id })
    } else {
      alert('Stripe session could not be created.')
    }
  }

  React.useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search)
    if (query.get('success')) {
      console.log('Order placed! You will receive an email confirmation.')
    }
    if (query.get('canceled')) {
      console.log('Order canceled -- continue to shop around and checkout when you’re ready.')
    }
  }, [])

  return (
    <form onSubmit={onCheckout}>
      <Button type="submit" role="link" size="lg" className="button sm:w-fit">
        {event.isFree ? 'Get Ticket' : 'Buy Ticket'}
      </Button>
    </form>
  )
}

export default Checkout
