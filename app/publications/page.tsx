'use server';

import { PublicationCards } from "../clientExports";


export default async function Publications() {

  return (
    <div className="md:col-span-3 p-4" key={"publications"}>
      <PublicationCards />
    </div>
  );
}
