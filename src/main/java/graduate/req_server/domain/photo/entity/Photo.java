package graduate.req_server.domain.photo.entity;

import io.hypersistence.utils.hibernate.id.Tsid;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "photo")
public class Photo {

    @Id
    @Tsid
    @Column(length = 13)
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false, unique = true)
    private String s3Key;

    @Column(nullable = false)
    private String originalFilename;

    private LocalDateTime takenDate;

    @Builder
    public Photo(String userId, String s3Key, String originalFilename, LocalDateTime takenDate) {
        this.userId = userId;
        this.s3Key = s3Key;
        this.originalFilename = originalFilename;
        this.takenDate = takenDate;
    }
}
