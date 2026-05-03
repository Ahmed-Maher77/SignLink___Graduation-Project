import 'package:flutter/material.dart';
import 'package:sign_link/core/config/assets.dart';
import 'package:sign_link/features/home/data/helper_options_item_model/helper_options_item_model.dart';
import 'package:sign_link/features/home/presentation/view/about_us_view.dart';
import 'package:sign_link/features/home/presentation/view/contact_us_view.dart';
import 'package:sign_link/features/home/presentation/view/widgets/custom_list_tile_item.dart';

class HelperOptions extends StatefulWidget {
  const HelperOptions({
    super.key,
  });

  @override
  State<HelperOptions> createState() => _HelperOptionsState();
}

class _HelperOptionsState extends State<HelperOptions> {
  List<HelperOptionsItemModel> helperOptionsItems = [
    HelperOptionsItemModel(
      title: "Languages",
      leadingIcon: Assets.imagesNetIcon,
      trailingIcon: Assets.imagesDownArrowIcon,
    ),
    HelperOptionsItemModel(
      title: "Contact Us",
      leadingIcon: Assets.imagesContactIcon,
      widgetBuilder: (context) => const ContactUsView(),
    ),
    HelperOptionsItemModel(
      title: "About Us",
      leadingIcon: Assets.imagesAboutUsIcon,
      widgetBuilder: (context) => const AboutUsView(),
    ),
    HelperOptionsItemModel(
      title: "Terms & Conditions",
      leadingIcon: Assets.imagesSimplificationIcon,
      isLastItem: true,
    )
  ];
  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(4, (index) {
        return CustomListTileItem(
          helperOptionsItemModel: helperOptionsItems[index],
        );
      }),
    );
  }
}
