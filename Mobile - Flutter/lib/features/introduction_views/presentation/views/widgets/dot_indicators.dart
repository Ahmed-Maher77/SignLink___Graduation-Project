import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:sign_link/features/introduction_views/presentation/manager/page_view_cubit/page_view_cubit.dart';
import 'package:sign_link/features/introduction_views/presentation/views/widgets/active_and_inactive_dot.dart';

class DotIndicators extends StatelessWidget {
  const DotIndicators({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PageViewCubit, PageViewState>(
      builder: (context, state) {
        int pageViewIndex;
        if (state is PageViewInitial) {
          pageViewIndex = 0;
        } else if (state is PageViewScroll) {
          pageViewIndex = state.index;
        } else {
          pageViewIndex = 2;
        }
        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            3,
            (index) {
              return ActiveAndInActiveDot(
                isActive: index == pageViewIndex,
              );
            },
          ),
        );
      },
    );
  }
}
