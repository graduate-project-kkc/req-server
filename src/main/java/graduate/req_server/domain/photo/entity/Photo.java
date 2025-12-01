package graduate.req_server.domain.photo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
