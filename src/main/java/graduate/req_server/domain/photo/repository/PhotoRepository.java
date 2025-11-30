package graduate.req_server.domain.photo.repository;

import graduate.req_server.domain.photo.entity.Photo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findByS3KeyIn(List<String> s3Keys);
}
