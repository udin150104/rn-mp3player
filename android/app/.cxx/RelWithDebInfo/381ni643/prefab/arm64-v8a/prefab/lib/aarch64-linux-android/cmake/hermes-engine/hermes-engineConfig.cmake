if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/home/syahrudin/.gradle/caches/8.14.1/transforms/d95bb36c035f37b88112d330ac41ce68/transformed/hermes-android-0.80.2-release/prefab/modules/libhermes/libs/android.arm64-v8a/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/syahrudin/.gradle/caches/8.14.1/transforms/d95bb36c035f37b88112d330ac41ce68/transformed/hermes-android-0.80.2-release/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

