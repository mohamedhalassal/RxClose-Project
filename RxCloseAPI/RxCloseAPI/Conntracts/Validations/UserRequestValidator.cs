using FluentValidation;
using RxCloseAPI.Conntracts.Requests;

namespace RxCloseAPI.Conntracts.Validations;

public class UserRequestValidator : AbstractValidator<UserRequest>
{
    public UserRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(x => x.UserName)
            .NotEmpty();

        RuleFor(x => x.Name)
            .NotEmpty();

        RuleFor(x => x.PhoneNumber)
            .NotEmpty()
            .NotNull();

        RuleFor(x => x.Password)
            .NotEmpty()
            .WithMessage("Add Your Password")
            .MinimumLength(6); // Reduced from 8 to 6 for testing
    }
}
