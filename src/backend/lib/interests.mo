import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/interests";

module {
  public func expressInterest(interests : Map.Map<Nat, Types.Interest>, nextId : { var value : Nat }, ideaId : Nat, buyer : Principal, message : Text) : Types.Interest {
    let id = nextId.value;
    nextId.value := id + 1;
    let interest : Types.Interest = {
      id;
      ideaId;
      buyer;
      message;
      createdAt = Time.now();
    };
    interests.add(id, interest);
    interest;
  };

  public func listInterestsForIdea(interests : Map.Map<Nat, Types.Interest>, ideaId : Nat) : [Types.Interest] {
    interests.values().filter(func interest = interest.ideaId == ideaId).toArray();
  };

  public func listInterestsByBuyer(interests : Map.Map<Nat, Types.Interest>, buyer : Principal) : [Types.Interest] {
    interests.values().filter(func interest = interest.buyer == buyer).toArray();
  };

  public func hasInterest(interests : Map.Map<Nat, Types.Interest>, ideaId : Nat, buyer : Principal) : Bool {
    interests.values().any(func interest = interest.ideaId == ideaId and interest.buyer == buyer);
  };
};
