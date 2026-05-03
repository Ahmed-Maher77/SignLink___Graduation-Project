import 'package:flutter/material.dart';
import 'package:sign_link/features/home/presentation/view/widgets/recents_list_item.dart';

class RecentsList extends StatelessWidget {
  const RecentsList({super.key});

  @override
  Widget build(BuildContext context) {
    return SliverList.builder(
      itemCount: 20,
      itemBuilder: (context, index) {
        return RecentsListItem(
          isLastIndex: index == 19,
        );
      },
    );
  }
}
