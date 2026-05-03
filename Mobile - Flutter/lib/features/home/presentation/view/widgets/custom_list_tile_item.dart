import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:sign_link/core/config/app_text_styles.dart';
import 'package:sign_link/core/utils/app_navigation.dart';
import 'package:sign_link/features/home/data/helper_options_item_model/helper_options_item_model.dart';

class CustomListTileItem extends StatelessWidget {
  const CustomListTileItem({
    required this.helperOptionsItemModel,
    super.key,
  });
  final HelperOptionsItemModel helperOptionsItemModel;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ListTile(
          onTap: () {
            if (helperOptionsItemModel.widgetBuilder != null) {
              AppNavigation.pushWithFadingAnimation(
                  context: context,
                  view: helperOptionsItemModel.widgetBuilder!(context));
            }
          },
          minTileHeight: 45,
          leading: SvgPicture.asset(helperOptionsItemModel.leadingIcon),
          trailing: helperOptionsItemModel.trailingIcon != null
              ? SvgPicture.asset(
                  helperOptionsItemModel.trailingIcon!,
                )
              : null,
          title: Text(
            helperOptionsItemModel.title,
            style: AppTextStyles.styleRegular12,
          ),
        ),
        const SizedBox(height: 4),
        helperOptionsItemModel.isLastItem
            ? const SizedBox()
            : const Divider(
                height: 8,
                color: Color(
                  0xffE9E9E9,
                ),
              )
      ],
    );
  }
}
