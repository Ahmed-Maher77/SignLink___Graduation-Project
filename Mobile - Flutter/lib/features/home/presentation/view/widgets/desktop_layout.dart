import 'package:flutter/material.dart';
import 'package:sign_link/features/home/presentation/view/widgets/home_drawer.dart';
import 'package:sign_link/features/home/presentation/view/widgets/home_view_body.dart';

class DesktopLayout extends StatelessWidget {
  const DesktopLayout({super.key});

  @override
  Widget build(BuildContext context) {
    return const Row(children: [
      Expanded(
        child: HomeDrawer(),
      ),
      Expanded(
        flex: 3,
        child: HomeViewBody(),
      ),
    ]);
  }
}
