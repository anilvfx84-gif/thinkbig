import Int "mo:core/Int";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/ideas";

module {
  public func createIdea(ideas : Map.Map<Nat, Types.Idea>, nextId : { var value : Nat }, owner : Principal, input : Types.IdeaInput, status : Types.IdeaStatus) : Types.Idea {
    let id = nextId.value;
    nextId.value := id + 1;
    let now = Time.now();
    let idea : Types.Idea = {
      id;
      owner;
      title = input.title;
      summary = input.summary;
      description = input.description;
      field = input.field;
      businessPlan = input.businessPlan;
      fundingTarget = input.fundingTarget;
      stage = input.stage;
      location = input.location;
      status;
      documents = input.documents;
      images = input.images;
      viewCount = 0;
      interestCount = 0;
      createdAt = now;
      updatedAt = now;
    };
    ideas.add(id, idea);
    idea;
  };

  public func updateIdea(ideas : Map.Map<Nat, Types.Idea>, owner : Principal, id : Nat, input : Types.IdeaInput) : ?Types.Idea {
    switch (ideas.get(id)) {
      case (?existing) {
        if (existing.owner != owner) {
          return null;
        };
        let updated : Types.Idea = {
          id = existing.id;
          owner = existing.owner;
          title = input.title;
          summary = input.summary;
          description = input.description;
          field = input.field;
          businessPlan = input.businessPlan;
          fundingTarget = input.fundingTarget;
          stage = input.stage;
          location = input.location;
          status = existing.status;
          documents = input.documents;
          images = input.images;
          viewCount = existing.viewCount;
          interestCount = existing.interestCount;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        ideas.add(id, updated);
        ?updated;
      };
      case null { null };
    };
  };

  public func setStatus(ideas : Map.Map<Nat, Types.Idea>, owner : Principal, id : Nat, status : Types.IdeaStatus) : ?Types.Idea {
    switch (ideas.get(id)) {
      case (?existing) {
        if (existing.owner != owner) {
          return null;
        };
        let updated : Types.Idea = {
          id = existing.id;
          owner = existing.owner;
          title = existing.title;
          summary = existing.summary;
          description = existing.description;
          field = existing.field;
          businessPlan = existing.businessPlan;
          fundingTarget = existing.fundingTarget;
          stage = existing.stage;
          location = existing.location;
          status;
          documents = existing.documents;
          images = existing.images;
          viewCount = existing.viewCount;
          interestCount = existing.interestCount;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        ideas.add(id, updated);
        ?updated;
      };
      case null { null };
    };
  };

  public func deleteIdea(ideas : Map.Map<Nat, Types.Idea>, owner : Principal, id : Nat) : Bool {
    switch (ideas.get(id)) {
      case (?existing) {
        if (existing.owner != owner) {
          return false;
        };
        ideas.remove(id);
        true;
      };
      case null { false };
    };
  };

  public func getIdea(ideas : Map.Map<Nat, Types.Idea>, id : Nat) : ?Types.Idea {
    ideas.get(id);
  };

  public func listIdeasByOwner(ideas : Map.Map<Nat, Types.Idea>, owner : Principal) : [Types.Idea] {
    ideas.values().filter(func idea = idea.owner == owner).toArray();
  };

  public func listPublishedIdeas(ideas : Map.Map<Nat, Types.Idea>, filter : Types.IdeaFilter) : [Types.Idea] {
    let searchTerm = switch (filter.search) {
      case (?s) { ?s.toLower() };
      case null { null };
    };
    let matched = ideas.values().filter(func idea = matchesFilter(idea, filter, searchTerm)).toArray();
    let sort = filter.sort ?? #newest;
    switch (sort) {
      case (#newest) {
        matched.sort(func (a, b) = Int.compare(b.createdAt, a.createdAt));
      };
      case (#mostViewed) {
        matched.sort(func (a, b) = Nat.compare(b.viewCount, a.viewCount));
      };
    };
  };

  func matchesFilter(idea : Types.Idea, filter : Types.IdeaFilter, searchTerm : ?Text) : Bool {
    if (idea.status != #published) {
      return false;
    };
    switch (filter.field) {
      case (?f) { if (idea.field != f) { return false } };
      case null {};
    };
    switch (filter.stage) {
      case (?s) { if (idea.stage != s) { return false } };
      case null {};
    };
    switch (filter.minFunding) {
      case (?min) {
        switch (idea.fundingTarget) {
          case (?target) { if (target < min) { return false } };
          case null { return false };
        };
      };
      case null {};
    };
    switch (filter.maxFunding) {
      case (?max) {
        switch (idea.fundingTarget) {
          case (?target) { if (target > max) { return false } };
          case null { return false };
        };
      };
      case null {};
    };
    switch (searchTerm) {
      case (?term) {
        if (term.size() > 0) {
          let titleMatch = idea.title.toLower().contains(#text term);
          let summaryMatch = idea.summary.toLower().contains(#text term);
          if (not titleMatch and not summaryMatch) { return false };
        };
      };
      case null {};
    };
    true;
  };

  public func incrementInterestCount(ideas : Map.Map<Nat, Types.Idea>, id : Nat) : ?Types.Idea {
    switch (ideas.get(id)) {
      case (?existing) {
        let updated : Types.Idea = {
          id = existing.id;
          owner = existing.owner;
          title = existing.title;
          summary = existing.summary;
          description = existing.description;
          field = existing.field;
          businessPlan = existing.businessPlan;
          fundingTarget = existing.fundingTarget;
          stage = existing.stage;
          location = existing.location;
          status = existing.status;
          documents = existing.documents;
          images = existing.images;
          viewCount = existing.viewCount;
          interestCount = existing.interestCount + 1;
          createdAt = existing.createdAt;
          updatedAt = existing.updatedAt;
        };
        ideas.add(id, updated);
        ?updated;
      };
      case null { null };
    };
  };

  public func recordView(ideas : Map.Map<Nat, Types.Idea>, id : Nat) : ?Types.Idea {
    switch (ideas.get(id)) {
      case (?existing) {
        let updated : Types.Idea = {
          id = existing.id;
          owner = existing.owner;
          title = existing.title;
          summary = existing.summary;
          description = existing.description;
          field = existing.field;
          businessPlan = existing.businessPlan;
          fundingTarget = existing.fundingTarget;
          stage = existing.stage;
          location = existing.location;
          status = existing.status;
          documents = existing.documents;
          images = existing.images;
          viewCount = existing.viewCount + 1;
          interestCount = existing.interestCount;
          createdAt = existing.createdAt;
          updatedAt = existing.updatedAt;
        };
        ideas.add(id, updated);
        ?updated;
      };
      case null { null };
    };
  };
};
