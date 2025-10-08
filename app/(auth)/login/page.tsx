import React, { Suspense } from "react"
import { LoginForm } from "./components/LoginForm"

const LoginPage = () => {
    return (
        <div className="flex h-svh items-center">
            <Suspense fallback={<div className="mx-auto">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    )
}

export default LoginPage