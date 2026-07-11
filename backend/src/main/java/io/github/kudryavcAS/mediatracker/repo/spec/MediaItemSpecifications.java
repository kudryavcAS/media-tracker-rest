package io.github.kudryavcAS.mediatracker.repo.spec;

import io.github.kudryavcAS.mediatracker.model.MediaFormat;
import io.github.kudryavcAS.mediatracker.model.MediaItem;
import io.github.kudryavcAS.mediatracker.model.WatchStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public final class MediaItemSpecifications {

    private MediaItemSpecifications() {
    }

    public static Specification<MediaItem> withFilters(MediaFormat format, WatchStatus status, String query) {
        return (root, criteriaQuery, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (format != null) {
                predicates.add(cb.equal(root.get("format"), format));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (StringUtils.hasText(query)) {
                String searchPattern = "%" + query.toLowerCase() + "%";

                Predicate titleLike = cb.like(cb.lower(root.get("title")), searchPattern);

                Predicate directorLike = cb.like(cb.lower(cb.coalesce(root.get("directors"), "")), searchPattern);

                predicates.add(cb.or(titleLike, directorLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}