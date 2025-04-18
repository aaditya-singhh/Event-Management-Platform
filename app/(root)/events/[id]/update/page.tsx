// app/(root)/events/[id]/update/page.tsx

import EventForm from "@/components/shared/EventForm";
import { getEventById } from "@/lib/actions/event.actions";
import { auth } from "@clerk/nextjs/server";
import React from "react";

type UpdateEventProps = {
  params: {
    id: string;
  };
};

const UpdateEvent = async ({ params: { id } }: UpdateEventProps) => {
  // Await the async auth() helper
  const { userId } = await auth();
  if (!userId) {
    return (
      <section className="wrapper py-20 text-center">
        <p className="p-regular-16">
          Please{" "}
          <a href="/sign-in" className="text-primary-500 underline">
            sign in
          </a>{" "}
          to update this event.
        </p>
      </section>
    );
  }

  const event = await getEventById(id);
  if (!event) {
    return (
      <section className="wrapper py-20 text-center">
        <p className="p-regular-16">Event not found.</p>
      </section>
    );
  }

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">
          Update Event
        </h3>
      </section>

      <div className="wrapper my-8">
        <EventForm
          type="Update"
          event={event}
          eventId={event._id}
          userId={userId}
        />
      </div>
    </>
  );
};

export default UpdateEvent;
