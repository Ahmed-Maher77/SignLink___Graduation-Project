import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:sign_link/core/config/assets.dart';

class AuthUsingFacebookOrGoogle extends StatelessWidget {
  const AuthUsingFacebookOrGoogle({
    super.key,
    this.onPressedFacebook,
    this.onPressedGoogle,
  });
  final void Function()? onPressedFacebook;
  final void Function()? onPressedGoogle;
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Spacer(
          flex: 2,
        ),
        iconSizedBox(
          onPressed: onPressedGoogle,
          icon: SvgPicture.asset(Assets.imagesGoogle),
        ),
        const Spacer(),
        iconSizedBox(
          icon: SvgPicture.asset(Assets.imagesFacebook),
          onPressed: onPressedFacebook,
        ),
        const Spacer(
          flex: 2,
        ),
      ],
    );
  }

  SizedBox iconSizedBox({required Widget icon, void Function()? onPressed}) {
    return SizedBox(
      height: 42,
      width: 42,
      child: IconButton(
        padding: EdgeInsets.zero,
        onPressed: onPressed,
        icon: icon,
      ),
    );
  }
}
