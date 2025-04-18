// app/(root)/events/create/page.tsx
import React from "react";
import EventForm from "@/components/shared/EventForm";
import { currentUser } from "@clerk/nextjs/server";

const CreateEvent = async () => {
  // this will be null if the user is not signed in
  const user = await currentUser();

  if (!user) {
    return (
      <section className="wrapper py-20 text-center">
        <p className="p-medium-16">Please sign in to create an event.</p>
      </section>
    );
  }

  const userId = user.id;

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">Create Event</h3>
      </section>

      <div className="wrapper my-8">
        <EventForm userId={userId} type="Create" />
      </div>
    </>
  );
};

export default CreateEvent;
