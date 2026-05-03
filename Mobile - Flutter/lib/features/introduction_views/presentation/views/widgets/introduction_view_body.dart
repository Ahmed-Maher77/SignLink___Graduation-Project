import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:sign_link/core/config/assets.dart';
import 'package:sign_link/features/introduction_views/data/introduction_view_model.dart';
import 'package:sign_link/features/introduction_views/presentation/manager/page_view_cubit/page_view_cubit.dart';
import 'package:sign_link/features/introduction_views/presentation/views/widgets/custom_introduction_view.dart';

class IntroductionViewsBody extends StatefulWidget {
  const IntroductionViewsBody({super.key});

  @override
  State<IntroductionViewsBody> createState() => _IntroductionViewsBodyState();
}

class _IntroductionViewsBodyState extends State<IntroductionViewsBody> {
  List<IntroductionViewModel> introductionViewModels = [
    IntroductionViewModel(
      title: "Unlock Communication, Embrace Connection",
      subTitle:
          "Welcome to Sign Link! Break language barriers and connect with the world through seamless sign language translation.",
      image: Assets.imagesVectorView1,
    ),
    IntroductionViewModel(
      title: "Real-Time Sign Language Translation",
      subTitle:
          "Simply let the app capture signs via the camera, and watch them transform into words. Fast, accurate, and empowering for all.",
      image: Assets.imagesVectorView2,
    ),
    IntroductionViewModel(
      title: "Ready to Translate?",
      subTitle:
          " Customize your experience, adjust preferences, and start bridging the communication gap today. Let's make conversations inclusive!",
      image: Assets.imagesVectorView3,
    ),
  ];

  PageController? pageViewController = PageController();
  int index = 0;
  @override
  void initState() {
    pageViewController!.addListener(() {
      index = pageViewController!.page!.round();
      BlocProvider.of<PageViewCubit>(context).scroll(index: index);
    });
    super.initState();
  }

  @override
  void dispose() {
    pageViewController!.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PageView.builder(
      controller: pageViewController,
      itemCount: 3,
      itemBuilder: (context, index) {
        return CustomIntroductionView(
          introductionViewModel: introductionViewModels[index],
          pageViewController: pageViewController,
          index: index,
        );
      },
    );
  }
}
