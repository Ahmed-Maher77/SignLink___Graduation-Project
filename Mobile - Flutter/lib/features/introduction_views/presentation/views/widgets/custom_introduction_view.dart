import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:sign_link/core/config/app_text_styles.dart';
import 'package:sign_link/core/helper/constants.dart';
import 'package:sign_link/core/utils/app_navigation.dart';
import 'package:sign_link/features/authentication/presentation/views/sign_in_view.dart';
import 'package:sign_link/features/introduction_views/data/introduction_view_model.dart';
import 'package:sign_link/features/introduction_views/presentation/views/widgets/dot_indicators.dart';

class CustomIntroductionView extends StatelessWidget {
  const CustomIntroductionView({
    required this.introductionViewModel,
    required this.index,
    super.key,
    this.pageViewController,
  });
  final PageController? pageViewController;
  final IntroductionViewModel introductionViewModel;
  final int index;
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(kViewPadding),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topRight,
          end: Alignment.bottomLeft,
          colors: [
            Color(0xff079291),
            Color(0xff325959),
          ],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(
            height: 30,
          ),
          Align(
            alignment: Alignment.topLeft,
            child: TextButton(
              onPressed: () {
                animateToPage(index: 2);
              },
              child: textBold14(text: "Skip"),
            ),
          ),
          const Spacer(
            flex: 5,
          ),
          SvgPicture.asset(introductionViewModel.image),
          const Flexible(
            child: SizedBox(
              height: 80,
            ),
          ),
          Text(
            textAlign: TextAlign.center,
            introductionViewModel.title,
            style: AppTextStyles.styleRegular24,
          ),
          const Flexible(
            child: SizedBox(
              height: 16,
            ),
          ),
          Text(
            textAlign: TextAlign.center,
            introductionViewModel.subTitle,
            style: AppTextStyles.styleRegular14.copyWith(
              color: const Color(
                0xffEEF2FF,
              ),
            ),
          ),
          const SizedBox(
            height: 30,
          ),
          const DotIndicators(),
          const Spacer(
            flex: 5,
          ),
          Row(children: [
            index > 0
                ? IconButton(
                    onPressed: () {
                      pageViewController!.animateToPage(
                        index - 1, // Index of the last page
                        duration: const Duration(milliseconds: 500),
                        curve: Curves.easeInOut,
                      );
                    },
                    icon: const Icon(
                      Icons.arrow_back_ios,
                      size: 20,
                      color: Color(0xffEEF2FF),
                    ),
                  )
                : const SizedBox(),
            const Spacer(),
            index == 2
                ? TextButton(
                    onPressed: () {
                      AppNavigation.pushWithSlidingAnimation(
                        context: context,
                        view: const SignInView(),
                      );
                    },
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        textBold14(text: "Swipe to sign in"),
                        const Icon(
                          Icons.arrow_forward_ios,
                          size: 20,
                          color: Color(0xffEEF2FF),
                        ),
                      ],
                    ),
                  )
                : IconButton(
                    onPressed: () {
                      animateToPage(index: index + 1);
                    },
                    icon: const Icon(
                      Icons.arrow_forward_ios,
                      size: 20,
                      color: Color(0xffEEF2FF),
                    ),
                  ),
          ])
        ],
      ),
    );
  }

  void animateToPage({required int index}) {
    pageViewController!.animateToPage(
      index, // Index of the last page
      duration: const Duration(milliseconds: 500),
      curve: Curves.easeInOut,
    );
  }

  Text textBold14({required String text}) {
    return Text(
      text,
      style: AppTextStyles.styleBold14,
    );
  }
}
