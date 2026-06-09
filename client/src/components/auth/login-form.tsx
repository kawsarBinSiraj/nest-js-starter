/**
 * components/auth/login-form.tsx
 *
 * Client component — sign-in form.
 *
 * Uses react-hook-form + yup for validation and the useLogin()
 * mutation hook for submitting credentials.
 *
 * Demo credentials (pre-filled):
 *   email:    admin@example.com
 *   password: password123
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Sparkles } from "lucide-react";
import { useLogin } from "@/hooks/auth/use-login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import GoogleLogin from "./google-login";
import type { GoogleLoginSuccessPayload } from "./google-login";

// ---- Yup schema ------------------------------------------------------

const loginSchema = yup.object({
   email: yup.string().email("Invalid email address").required("Email is required"),
   password: yup.string().min(1, "Password is required").required("Password is required"),
});

type LoginFields = yup.InferType<typeof loginSchema>;

// ---- Component --------------------------------------------------------

export function LoginForm() {
   const [showPassword, setShowPassword] = useState(false);
   const { mutate: login, isPending, error } = useLogin();

   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<LoginFields>({
      resolver: yupResolver(loginSchema),
      // Pre-fill with demo credentials for quick testing
      defaultValues: { email: "admin@example.com", password: "password123" },
   });

   function onSubmit(data: LoginFields) {
      login({ email: data.email, password: data.password });
   }

   function handleGoogleSuccess({ tokenResponse, tokenInfo, isLoading }: GoogleLoginSuccessPayload) {
      console.log("[Google OAuth] isLoading", isLoading);
      console.log("[Google OAuth] tokenResponse", tokenResponse);
      console.log("[Google OAuth] tokenInfo", tokenInfo);
   }

   return (
      <Card className="mx-auto w-full max-w-md rounded-3xl border-white/50 bg-white/85 shadow-2xl shadow-amber-950/10 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/65 dark:shadow-black/40">
         {/* Header */}
         <CardHeader className="space-y-3 pb-3">
            <div className="flex items-center gap-2">
               <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                  <Sparkles className="size-3.5" />
                  Welcome back
               </div>
            </div>
            <CardTitle className="text-3xl tracking-tight">Sign in</CardTitle>
            <CardDescription className="text-sm text-slate-600 dark:text-slate-300">
               Enter your credentials to access your account
            </CardDescription>
         </CardHeader>

         <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="flex flex-col gap-5">
               {/* Server error banner */}
               {error && (
                  <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                     {error.message}
                  </div>
               )}

               {/* Email */}
               <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                     Email
                  </Label>
                  <Input
                     id="email"
                     type="email"
                     placeholder="you@example.com"
                     autoComplete="email"
                     className="h-11 rounded-full px-5 bg-white/90 dark:bg-slate-900/80"
                     {...register("email")}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
               </div>

               {/* Password */}
               <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                     <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                        Password
                     </Label>
                     <Link to="/forgot" className="text-xs font-medium text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline dark:text-slate-300 dark:hover:text-slate-100">
                        Forgot password?
                     </Link>
                  </div>
                  <div className="relative">
                     <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="········"
                        autoComplete="current-password"
                        className="h-11 rounded-full px-5 pr-11 bg-white/90 dark:bg-slate-900/80"
                        {...register("password")}
                     />
                     <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                     >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                     </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
               </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-2">
               <Button type="submit" className="h-11 w-full rounded-full text-sm font-semibold" disabled={isPending}>
                  {isPending ? "Signing in…" : "Sign in"}
               </Button>

               <div className="relative w-full py-1">
                  <div className="absolute inset-0 flex items-center">
                     <span className="w-full border-t border-slate-200/80 dark:border-slate-700/70" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-[0.18em]">
                     <span className="bg-white px-2 text-slate-500 dark:bg-slate-950 dark:text-slate-400">or continue with</span>
                  </div>
               </div>

               <GoogleLogin onSuccess={handleGoogleSuccess} />

               <p className="text-center text-sm text-slate-600 dark:text-slate-300">
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className="font-semibold text-slate-900 underline-offset-4 hover:underline dark:text-slate-100">
                     Sign up
                  </Link>
               </p>
            </CardFooter>
         </form>
      </Card>
   );
}
