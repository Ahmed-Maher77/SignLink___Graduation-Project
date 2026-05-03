import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:sign_link/core/config/app_colors.dart';
import 'package:sign_link/features/home/presentation/manager/cubit/home_view_cubit.dart';
import 'package:sign_link/features/home/presentation/view/widgets/contacts_list.dart';

import 'package:sign_link/features/home/presentation/view/widgets/recents_and_contacts_button.dart';
import 'package:sign_link/features/home/presentation/view/widgets/recents_list.dart';

import 'package:sign_link/features/home/presentation/view/widgets/search_text_field.dart';

class HomeContainerContent extends StatelessWidget {
  const HomeContainerContent({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<HomeViewCubit, HomeViewState>(
      builder: (context, state) {
        return CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    height: 50,
                    decoration: BoxDecoration(
                      color: AppColors.grey20,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: RecentsAndContactsButton(
                      state: state,
                    ),
                  ),
                  const SizedBox(
                    height: 24,
                  ),
                  const SearchTextField(),
                  const SizedBox(
                    height: 20,
                  ),
                ],
              ),
            ),
            buildRecentsOrContactsList(state),
          ],
        );
      },
    );
  }

  Widget buildRecentsOrContactsList(HomeViewState state) {
    if (state is HomeViewRecents) {
      return const RecentsList();
    } else if (state is HomeViewContacts) {
      return const ContactsList();
    } else {
      return const SizedBox();
    }
  }
}
