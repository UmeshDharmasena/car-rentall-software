import React, { Suspense } from "react"
import { SignUpForm } from "./components/SignUpForm"

const SignUpPage = () => {
    return (
        <div className="flex h-svh items-center">
            <Suspense fallback={<div className="mx-auto">Loading...</div>}>
                <SignUpForm />
            </Suspense>
        </div>
    )
}

export default SignUpPage