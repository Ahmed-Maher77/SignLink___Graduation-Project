import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:sign_link/core/config/assets.dart';
import 'package:sign_link/core/utils/app_navigation.dart';
import 'package:sign_link/features/home/presentation/view/customer_assistant_view.dart';
import 'package:sign_link/features/home/presentation/view/widgets/home_view_content.dart';

class HomeViewBody extends StatelessWidget {
  const HomeViewBody({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        const HomeViewBodyContent(),
        Positioned(
            right: 8,
            bottom: 108,
            child: IconButton(
              onPressed: () {
                AppNavigation.pushWithFadingAnimation(
                  context: context,
                  view: const CustomerAssistantView(),
                );
              },
              icon: SvgPicture.asset(
                Assets.imagesCustomerServiceSupport,
                fit: BoxFit.fill,
              ),
            )),
      ],
    );
  }
}
