import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:sign_link/features/introduction_views/presentation/manager/page_view_cubit/page_view_cubit.dart';
import 'package:sign_link/features/introduction_views/presentation/views/widgets/introduction_view_body.dart';

class IntroductionViews extends StatelessWidget {
  const IntroductionViews({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocProvider(
        create: (context) => PageViewCubit(),
        child: const IntroductionViewsBody(),
      ),
    );
  }
}
