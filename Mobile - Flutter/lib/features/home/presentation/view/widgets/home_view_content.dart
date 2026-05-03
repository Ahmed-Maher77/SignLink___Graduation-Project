import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:sign_link/features/authentication/presentation/views/widgets/custom_button.dart';
import 'package:sign_link/features/home/presentation/manager/cubit/home_view_cubit.dart';
import 'package:sign_link/features/home/presentation/view/widgets/home_container_content.dart';

class HomeViewBodyContent extends StatelessWidget {
  const HomeViewBodyContent({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: Container(
            padding: const EdgeInsets.only(left: 24, right: 24, top: 24),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                topRight: Radius.circular(60),
                topLeft: Radius.circular(60),
              ),
            ),
            child: BlocProvider(
              create: (context) => HomeViewCubit(),
              child: const HomeContainerContent(),
            ),
          ),
        ),
        DecoratedBox(
          decoration: const BoxDecoration(
            color: Colors.white,
          ),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: CustomButton(
                  text: "Create Meeting",
                  onPressed: () {},
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ],
    );
  }
}
