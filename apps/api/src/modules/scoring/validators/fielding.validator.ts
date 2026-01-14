import { BadRequestException } from '@nestjs/common';
import { CreateBallDto } from '../../balls/dto/create-ball.dto';
import { InningsState } from '../domain/innings.state';

export class FieldingValidator {
    static validate(
        dto: CreateBallDto,
        state: InningsState,
    ) {
        const outside = dto.fieldersOutsideCircle;

        if (outside < 0 || outside > 9) {
            throw new BadRequestException(
                'Invalid number of fielders outside circle',
            );
        }

        // 🟡 Powerplay rule
        if (dto.fieldersOutsideCircle > state.maxFieldersOutside) {
            throw new BadRequestException(
                `Only ${state.maxFieldersOutside} fielders allowed outside circle during ${state.powerplayPhase}`,
            );
        } else {
            // Non-powerplay rule
            if (outside > 5) {
                throw new BadRequestException(
                    'Only 5 fielders allowed outside circle',
                );
            }
        }
    }
}
