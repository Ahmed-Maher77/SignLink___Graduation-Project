import 'package:flutter/material.dart';

import 'package:sign_link/core/config/app_colors.dart';
import 'package:sign_link/core/config/app_text_styles.dart';
import 'package:sign_link/core/config/assets.dart';
import 'package:sign_link/core/helper/constants.dart';
import 'package:sign_link/core/helper/validate_email.dart';
import 'package:sign_link/core/helper/validate_name.dart';
import 'package:sign_link/core/helper/validate_password.dart';

import 'package:sign_link/core/utils/app_navigation.dart';

import 'package:sign_link/features/authentication/presentation/views/widgets/auth_using_facebook_or_google.dart';
import 'package:sign_link/features/authentication/presentation/views/widgets/custom_button.dart';
import 'package:sign_link/features/authentication/presentation/views/widgets/custom_text_form_field.dart';
import 'package:sign_link/features/authentication/presentation/views/widgets/dividers_with_or_text.dart';

import 'package:sign_link/features/home/presentation/view/home_view.dart';

class SignUpViewBody extends StatefulWidget {
  const SignUpViewBody({super.key});

  @override
  State<SignUpViewBody> createState() => _SignUpViewBodyState();
}

class _SignUpViewBodyState extends State<SignUpViewBody> {
  GlobalKey<FormState> formKey = GlobalKey();
  AutovalidateMode? autovalidateMode = AutovalidateMode.disabled;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: kViewPadding),
      child: SingleChildScrollView(
        child: Form(
          key: formKey,
          autovalidateMode: autovalidateMode,
          child: Column(
            children: [
              const SizedBox(
                height: 40,
              ),
              CustomTextFormField(
                validator: (name) {
                  return validataName(name);
                },
                hint: "Enter Your Name",
                icon: Assets.imagesProfileIcon,
                title: "Full Name",
              ),
              const SizedBox(
                height: 24,
              ),
              CustomTextFormField(
                validator: (email) {
                  return validateEmail(email);
                },
                hint: "Enter Your Email Address",
                icon: Assets.imagesEmailMailIcon,
                title: "Email Address",
              ),
              const SizedBox(
                height: 24,
              ),
              CustomTextFormField(
                validator: (password) {
                  return validatePassword(password);
                },
                hint: "Enter Password",
                icon: Assets.imagesPasswordIcon,
                title: "Password",
              ),
              const SizedBox(
                height: 24,
              ),
              CustomButton(
                text: "Sign Up",
                onPressed: () {
                  if (formKey.currentState!.validate()) {
                    navigateToHomeView(context);
                  } else {
                    setState(() {
                      autovalidateMode = AutovalidateMode.always;
                    });
                  }
                },
              ),
              const SizedBox(
                height: 40,
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    "Already have an account?",
                    style: AppTextStyles.styleMedium14,
                  ),
                  TextButton(
                    onPressed: () {
                      AppNavigation.pop(context);
                    },
                    child: Text(
                      "Sign In",
                      style: AppTextStyles.styleMedium14.copyWith(
                        color: AppColors.appPrimaryColor,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(
                height: 32,
              ),
              const DividersWithOrText(),
              const SizedBox(
                height: 10,
              ),
              const AuthUsingFacebookOrGoogle(),
            ],
          ),
        ),
      ),
    );
  }

  void navigateToHomeView(BuildContext context) {
    AppNavigation.pushAndRemoveAllWithFadingAnimation(
      context: context,
      view: const HomeView(),
    );
  }
}
