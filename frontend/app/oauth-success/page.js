"use client"

import { Suspense } from "react"
import OAuthSuccess from "@/components/OAuthHandler"

export default function page() {
  return(
    <Suspense fallback={<p>hi there</p>}>
      <OAuthSuccess/>
    </Suspense>
  )
}